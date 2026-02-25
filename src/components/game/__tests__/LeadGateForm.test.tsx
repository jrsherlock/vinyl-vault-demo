import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LeadGateForm from '../LeadGateForm';

// Mock Supabase client
const mockSignInWithOtp = vi.fn();
const mockVerifyOtp = vi.fn();

vi.mock('@/lib/supabase/client', () => ({
  supabase: {
    auth: {
      signInWithOtp: (...args: any[]) => mockSignInWithOtp(...args),
      verifyOtp: (...args: any[]) => mockVerifyOtp(...args),
    },
  },
}));

// Mock telemetry
vi.mock('@/lib/telemetry', () => ({
  telemetry: {
    gateCompleted: vi.fn(),
  },
}));

describe('LeadGateForm', () => {
  const mockOnComplete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve({ success: true }),
    });
  });

  it('renders step 1 form fields', () => {
    render(<LeadGateForm onComplete={mockOnComplete} />);
    expect(screen.getByPlaceholderText('Your name *')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email address *')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Company (optional)')).toBeInTheDocument();
    expect(screen.getByText('Send Verification Code')).toBeInTheDocument();
  });

  it('shows validation error for empty name/email', async () => {
    render(<LeadGateForm onComplete={mockOnComplete} />);
    fireEvent.click(screen.getByText('Send Verification Code'));
    expect(screen.getByText('Name and email are required')).toBeInTheDocument();
  });

  it('shows validation error for invalid email', async () => {
    render(<LeadGateForm onComplete={mockOnComplete} />);
    fireEvent.change(screen.getByPlaceholderText('Your name *'), { target: { value: 'John' } });
    fireEvent.change(screen.getByPlaceholderText('Email address *'), { target: { value: 'user@test' } });
    fireEvent.click(screen.getByText('Send Verification Code'));
    expect(screen.getByText('Please enter a valid email')).toBeInTheDocument();
  });

  it('transitions to step 2 after successful OTP send', async () => {
    mockSignInWithOtp.mockResolvedValue({ error: null });

    render(<LeadGateForm onComplete={mockOnComplete} />);
    fireEvent.change(screen.getByPlaceholderText('Your name *'), { target: { value: 'John' } });
    fireEvent.change(screen.getByPlaceholderText('Email address *'), { target: { value: 'john@test.com' } });
    fireEvent.click(screen.getByText('Send Verification Code'));

    await waitFor(() => {
      expect(screen.getByText('Check your email')).toBeInTheDocument();
      expect(screen.getByText('john@test.com')).toBeInTheDocument();
      expect(screen.getByText('Verify & Unlock')).toBeInTheDocument();
    });
  });

  it('shows error when OTP send fails', async () => {
    mockSignInWithOtp.mockResolvedValue({
      error: { message: 'Email rate limit exceeded', status: 429 },
    });

    render(<LeadGateForm onComplete={mockOnComplete} />);
    fireEvent.change(screen.getByPlaceholderText('Your name *'), { target: { value: 'John' } });
    fireEvent.change(screen.getByPlaceholderText('Email address *'), { target: { value: 'john@test.com' } });
    fireEvent.click(screen.getByText('Send Verification Code'));

    await waitFor(() => {
      expect(screen.getByText('Too many attempts. Please wait a few minutes.')).toBeInTheDocument();
    });
  });

  it('calls onComplete after successful verification', async () => {
    mockSignInWithOtp.mockResolvedValue({ error: null });
    mockVerifyOtp.mockResolvedValue({ error: null });

    render(<LeadGateForm onComplete={mockOnComplete} />);

    // Step 1: fill form
    fireEvent.change(screen.getByPlaceholderText('Your name *'), { target: { value: 'John' } });
    fireEvent.change(screen.getByPlaceholderText('Email address *'), { target: { value: 'john@test.com' } });
    fireEvent.click(screen.getByText('Send Verification Code'));

    // Step 2: enter code
    await waitFor(() => {
      expect(screen.getByPlaceholderText('000000')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText('000000'), { target: { value: '123456' } });
    fireEvent.click(screen.getByText('Verify & Unlock'));

    await waitFor(() => {
      expect(mockOnComplete).toHaveBeenCalled();
    });
  });

  it('shows error for incorrect code without calling onComplete', async () => {
    mockSignInWithOtp.mockResolvedValue({ error: null });
    mockVerifyOtp.mockResolvedValue({
      error: { message: 'Token has expired or is invalid' },
    });

    render(<LeadGateForm onComplete={mockOnComplete} />);

    // Step 1
    fireEvent.change(screen.getByPlaceholderText('Your name *'), { target: { value: 'John' } });
    fireEvent.change(screen.getByPlaceholderText('Email address *'), { target: { value: 'john@test.com' } });
    fireEvent.click(screen.getByText('Send Verification Code'));

    // Step 2
    await waitFor(() => {
      expect(screen.getByPlaceholderText('000000')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText('000000'), { target: { value: '999999' } });
    fireEvent.click(screen.getByText('Verify & Unlock'));

    await waitFor(() => {
      expect(screen.getByText(/Code expired or incorrect/)).toBeInTheDocument();
    });
    expect(mockOnComplete).not.toHaveBeenCalled();
  });

  it('returns to step 1 when "Different email" is clicked', async () => {
    mockSignInWithOtp.mockResolvedValue({ error: null });

    render(<LeadGateForm onComplete={mockOnComplete} />);
    fireEvent.change(screen.getByPlaceholderText('Your name *'), { target: { value: 'John' } });
    fireEvent.change(screen.getByPlaceholderText('Email address *'), { target: { value: 'john@test.com' } });
    fireEvent.click(screen.getByText('Send Verification Code'));

    await waitFor(() => {
      expect(screen.getByText('Check your email')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Different email'));

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Your name *')).toBeInTheDocument();
      // Name should be preserved
      expect(screen.getByPlaceholderText('Your name *')).toHaveValue('John');
    });
  });
});
