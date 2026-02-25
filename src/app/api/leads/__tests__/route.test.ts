import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '../route';

const mockUpsert = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
  createServiceClient: () => ({
    from: () => ({
      upsert: mockUpsert,
    }),
  }),
}));

function makeRequest(body: Record<string, unknown>) {
  return new Request('http://localhost/api/leads', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/leads', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUpsert.mockResolvedValue({ error: null });
  });

  it('returns 400 when email is missing', async () => {
    const res = await POST(makeRequest({ name: 'John' }));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain('Email and name are required');
  });

  it('returns 400 when name is missing', async () => {
    const res = await POST(makeRequest({ email: 'john@test.com' }));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain('Email and name are required');
  });

  it('returns 400 for invalid email format', async () => {
    const res = await POST(makeRequest({ email: 'notanemail', name: 'John' }));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain('Invalid email format');
  });

  it('upserts lead and returns success for valid payload', async () => {
    const res = await POST(makeRequest({
      email: 'John@Test.com',
      name: ' John Doe ',
      company: 'Acme Corp',
      role: 'Developer',
    }));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);

    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'john@test.com',
        name: 'John Doe',
        company: 'Acme Corp',
        role: 'Developer',
        verified: true,
      }),
      { onConflict: 'email' }
    );
  });

  it('returns 500 when database upsert fails', async () => {
    mockUpsert.mockResolvedValue({ error: { message: 'DB connection failed' } });
    const res = await POST(makeRequest({ email: 'john@test.com', name: 'John' }));
    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.error).toContain('Failed to store lead');
  });

  it('normalizes email to lowercase and trims whitespace', async () => {
    await POST(makeRequest({ email: '  USER@EXAMPLE.COM  ', name: '  Jane  ' }));
    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'user@example.com',
        name: 'Jane',
      }),
      { onConflict: 'email' }
    );
  });
});
