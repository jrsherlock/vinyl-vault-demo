import { describe, it, expect } from 'vitest';
import { lookup_product, lookup_order, lookup_customer, apply_discount } from '../index';

describe('lookup_product', () => {
  it('finds records by artist name', async () => {
    const results = await lookup_product('Miles Davis');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].artist.toLowerCase()).toContain('miles davis');
  });

  it('returns empty array for no match', async () => {
    const results = await lookup_product('xyznonexistent');
    expect(results).toEqual([]);
  });
});

describe('lookup_order', () => {
  it('returns order by valid ID', async () => {
    const result = await lookup_order('ORD-2024-001');
    expect(result).toHaveProperty('id', 'ORD-2024-001');
  });

  it('returns error for invalid ID', async () => {
    const result = await lookup_order('FAKE-ORDER');
    expect(result).toEqual({ error: 'Order not found' });
  });
});

describe('apply_discount', () => {
  it('validates known discount codes', async () => {
    const save10 = await apply_discount('cart-1', 'SAVE10');
    expect(save10.success).toBe(true);
    expect(save10.discount).toBe('10%');

    const backstage = await apply_discount('cart-1', 'BACKSTAGE_PASS_90');
    expect(backstage.success).toBe(true);
    expect(backstage.discount).toBe('90%');
  });
});
