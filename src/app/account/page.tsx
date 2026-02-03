import { User, Package, Settings, CreditCard, LogOut, MapPin, ChevronRight, Disc } from 'lucide-react';
import Link from 'next/link';

export default function AccountPage() {
  const mockOrders = [
    { id: 'VV-8942', date: 'Oct 12, 2024', total: '$89.50', status: 'Delivered' },
    { id: 'VV-9120', date: 'Nov 04, 2024', total: '$142.99', status: 'In Transit' },
  ];

  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <header className="mb-12">
          <h1 className="text-4xl font-serif font-bold mb-2">My Account</h1>
          <p className="text-muted-foreground italic">Welcome back to the Vault.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          {/* Sidebar Navigation */}
          <aside className="lg:col-span-1 border-r border-border pr-8">
            <nav className="space-y-1">
              <button className="w-full flex items-center gap-3 px-4 py-3 bg-primary text-white rounded-xl font-bold transition-all">
                <User className="h-5 w-5" /> Profile
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-3 text-muted-foreground hover:bg-muted rounded-xl font-medium transition-all group">
                <Package className="h-5 w-5 group-hover:text-primary" /> Orders
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-3 text-muted-foreground hover:bg-muted rounded-xl font-medium transition-all group">
                <CreditCard className="h-5 w-5 group-hover:text-primary" /> Payments
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-3 text-muted-foreground hover:bg-muted rounded-xl font-medium transition-all group">
                <Settings className="h-5 w-5 group-hover:text-primary" /> Settings
              </button>
              <div className="pt-4 mt-4 border-t border-border">
                <button className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl font-medium transition-all">
                  <LogOut className="h-5 w-5" /> Logout
                </button>
              </div>
            </nav>
          </aside>

          {/* Main Content Area */}
          <div className="lg:col-span-3 space-y-12">
            {/* Profile Overview Card */}
            <section className="bg-muted/30 rounded-3xl p-8 border border-border">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center text-white relative group overflow-hidden">
                  <User className="h-10 w-10" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <span className="text-[10px] font-bold uppercase">Edit</span>
                  </div>
                </div>
                <div className="text-center md:text-left">
                  <h2 className="text-2xl font-serif font-bold">Standard Collector</h2>
                  <p className="text-muted-foreground mb-4 font-medium">collector@example.com</p>
                  <div className="flex flex-wrap justify-center md:justify-start gap-3">
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-accent/20 text-accent-foreground text-xs font-bold rounded-full border border-accent/20">
                      <Disc className="h-3 w-3 animate-spin-slow" /> Silver Tier
                    </span>
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full border border-primary/20">
                      Member since 2021
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* Quick Stats Grid */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-background border border-border p-6 rounded-2xl shadow-sm">
                <p className="text-sm text-muted-foreground mb-1 uppercase font-bold tracking-wider">Total Orders</p>
                <p className="text-3xl font-serif font-bold">12</p>
              </div>
              <div className="bg-background border border-border p-6 rounded-2xl shadow-sm">
                <p className="text-sm text-muted-foreground mb-1 uppercase font-bold tracking-wider">Collection Value</p>
                <p className="text-3xl font-serif font-bold">$1,240</p>
              </div>
              <div className="bg-background border border-border p-6 rounded-2xl shadow-sm">
                <p className="text-sm text-muted-foreground mb-1 uppercase font-bold tracking-wider">Rewards Balance</p>
                <p className="text-3xl font-serif font-bold">250 pts</p>
              </div>
            </section>

            {/* Recent Orders Table */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-serif font-bold">Recent Orders</h3>
                <button className="text-primary font-bold text-sm hover:underline">View All</button>
              </div>
              <div className="bg-background border border-border rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-muted/50 border-b border-border">
                      <th className="px-6 py-4 text-sm font-bold uppercase tracking-wider">Order ID</th>
                      <th className="px-6 py-4 text-sm font-bold uppercase tracking-wider">Date</th>
                      <th className="px-6 py-4 text-sm font-bold uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-sm font-bold uppercase tracking-wider text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {mockOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-muted/20 transition-colors cursor-pointer">
                        <td className="px-6 py-4 font-bold text-primary">{order.id}</td>
                        <td className="px-6 py-4 text-sm">{order.date}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase border ${
                            order.status === 'Delivered' 
                              ? 'bg-green-50 text-green-700 border-green-200' 
                              : 'bg-blue-50 text-blue-700 border-blue-200'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-right">{order.total}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Account Information Section */}
            <section className="space-y-6">
              <h3 className="text-2xl font-serif font-bold">Saved Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border border-border p-6 rounded-2xl flex items-start gap-4">
                  <div className="p-3 bg-muted rounded-xl">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-bold">Shipping Address</p>
                      <button className="text-[10px] font-bold uppercase text-muted-foreground hover:text-primary transition-colors">Edit</button>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      1234 Oak Street<br />
                      Des Moines, IA 50309
                    </p>
                  </div>
                </div>
                <div className="border border-border p-6 rounded-2xl flex items-start gap-4">
                  <div className="p-3 bg-muted rounded-xl">
                    <CreditCard className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-bold">Payment Method</p>
                      <button className="text-[10px] font-bold uppercase text-muted-foreground hover:text-primary transition-colors">Edit</button>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed flex items-center gap-2">
                      <span className="font-bold tracking-widest text-[10px]">•••• 4242</span>
                      <span className="text-[10px] bg-muted px-2 py-0.5 rounded font-bold">EXP 12/26</span>
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
