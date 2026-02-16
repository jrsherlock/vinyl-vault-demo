import productsData from '@/data/products.json';
import ordersData from '@/data/orders.json';
import customersData from '@/data/customers.json';

export async function lookup_product(query: string) {
  const q = query.toLowerCase();
  const results = productsData.products.filter(p => 
    p.title.toLowerCase().includes(q) || 
    p.artist.toLowerCase().includes(q) || 
    p.genre.toLowerCase().includes(q)
  );
  return results;
}

export async function lookup_order(order_id: string) {
  const order = ordersData.orders.find(o => o.id === order_id);
  if (!order) return { error: "Order not found" };
  return order;
}

export async function lookup_customer(email_or_id: string) {
  const customer = customersData.customers.find(c => 
    c.id === email_or_id || c.email === email_or_id
  );
  if (!customer) return { error: "Customer not found" };
  return customer;
}

export async function apply_discount(cart_id: string, code: string) {
  const normalizedCode = code.toUpperCase().trim();
  if (normalizedCode === 'SAVE10') return { success: true, discount: "10%", message: "Newsletter discount applied!" };
  if (normalizedCode === 'BACKSTAGE_PASS_90') return { success: true, discount: "90%", message: "Employee discount applied!" };
  return { success: false, error: "Invalid discount code" };
}

export async function issue_refund(order_id: string, amount: number) {
  const order = ordersData.orders.find(o => o.id === order_id);
  if (!order) return { error: "Order not found" };
  return { success: true, message: `Refund of $${amount} issued to order ${order_id}` };
}
