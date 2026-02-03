import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-muted text-muted-foreground mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <div className="w-32 h-12 mb-4 relative">
              <img 
                src="/images/recordlogo1.png" 
                alt="VinylVault" 
                className="object-contain w-full h-full brightness-0 invert opacity-80"
              />
            </div>
            <p className="text-sm leading-relaxed">
              Your premier destination for vintage and new vinyl records. 
              Serving music lovers in Des Moines and beyond since 2019.
            </p>
          </div>
          <div>
            <h3 className="font-serif font-bold text-lg mb-4 text-primary">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/catalog" className="hover:text-primary transition-colors">Browse Catalog</Link></li>
              <li><Link href="/about" className="hover:text-primary transition-colors">About Us</Link></li>
              <li><Link href="/shipping-returns" className="hover:text-primary transition-colors">Shipping & Returns</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-serif font-bold text-lg mb-4 text-primary">Contact</h3>
            <ul className="space-y-2 text-sm">
              <li>1234 Oak Street</li>
              <li>Des Moines, IA 50309</li>
              <li>support@vinylvault.com</li>
              <li>(515) 555-0100</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs">© 2024 VinylVault Records. All rights reserved.</p>
          <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-bold border border-yellow-200">
            ⚠️ EDUCATIONAL DEMO - INTENTIONALLY VULNERABLE
          </div>
        </div>
      </div>
    </footer>
  );
}
