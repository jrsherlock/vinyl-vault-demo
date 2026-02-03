import { Truck, RefreshCcw, Globe, ShieldCheck, Mail, Clock } from 'lucide-react';

export default function ShippingReturnsPage() {
  return (
    <div className="bg-background pt-16 pb-24">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-16 text-center">
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">Shipping & Returns</h1>
          <p className="text-muted-foreground text-lg">
            Everything you need to know about getting your records safely and what to do if things aren't quite right.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20">
          <div className="space-y-6">
            <div className="bg-primary/5 w-12 h-12 rounded-xl flex items-center justify-center">
              <Truck className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-2xl font-serif font-bold">Shipping Policy</h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                <strong>Domestic (US):</strong> We offer flat-rate $5 shipping on all orders via USPS Media Mail. Orders over $75 ship for free.
              </p>
              <p>
                <strong>Processing Time:</strong> Most orders are packed and shipped within 1-2 business days. You will receive a tracking number as soon as your label is created.
              </p>
              <p>
                <strong>Safe Packaging:</strong> We use reinforced, double-walled "Mighty Music" mailers with inner cardboard stiffeners to ensure your vinyl arrives in pristine condition.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-accent/10 w-12 h-12 rounded-xl flex items-center justify-center">
              <RefreshCcw className="h-6 w-6 text-accent-foreground" />
            </div>
            <h2 className="text-2xl font-serif font-bold">Returns & Exchanges</h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                <strong>30-Day Guarantee:</strong> If you're not satisfied with your purchase, you can return unplayed records in their original packaging within 30 days for a full refund or store credit.
              </p>
              <p>
                <strong>Defective Items:</strong> While we inspect every record, manufacturing defects occasionally happen. Contact us within 7 days of receipt for a replacement or prepaid return label.
              </p>
              <p>
                <strong>Exchanges:</strong> Ordered the wrong version? We're happy to exchange any sealed record for another item of equal value.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-muted rounded-3xl p-8 md:p-12">
          <h3 className="text-2xl font-serif font-bold mb-8 text-center">Frequently Asked Questions</h3>
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <h4 className="font-bold flex items-center gap-2"><Globe className="h-4 w-4 text-primary" /> Do you ship internationally?</h4>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Yes! We ship to over 50 countries. Rates are calculated at checkout based on weight and destination.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-bold flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" /> Is my shipment insured?</h4>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Every order over $100 is automatically insured. For smaller orders, you can add insurance at checkout for a nominal fee.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-bold flex items-center gap-2"><Clock className="h-4 w-4 text-primary" /> How long does international shipping take?</h4>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Typically 10-21 business days, depending on customs processing in your country.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-bold flex items-center gap-2"><Mail className="h-4 w-4 text-primary" /> How do I start a return?</h4>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Simply email <strong>returns@vinylvault.com</strong> with your order number and the reason for the return.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-20 border-t border-border pt-12 text-center">
          <p className="text-muted-foreground mb-6 italic">
            "We handle every record like it's going into our own private collection."
          </p>
          <div className="flex justify-center gap-8 text-sm font-bold text-primary italic uppercase tracking-widest">
            <span>#KeepSpinning</span>
            <span>#VinylCommunity</span>
          </div>
        </div>
      </div>
    </div>
  );
}
