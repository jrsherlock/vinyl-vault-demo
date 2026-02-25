import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ChatWidget from '../chat/ChatWidget';

// Mock the GameContext
const mockDismissSolvedLevel = vi.fn();
let mockGameState = {
  currentLevel: 1 as number,
  incrementMessageCount: vi.fn(),
  messageCounts: {} as Record<number, number>,
  justSolvedLevel: null as number | null,
  dismissSolvedLevel: mockDismissSolvedLevel,
};

vi.mock('@/context/GameContext', () => ({
  useGame: () => mockGameState,
}));

// Mock telemetry
vi.mock('@/lib/telemetry', () => ({
  telemetry: {
    chatMessageSent: vi.fn(),
    chatResponse: vi.fn(),
    guardTriggered: vi.fn(),
  },
}));

describe('ChatWidget', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    mockGameState = {
      currentLevel: 1,
      incrementMessageCount: vi.fn(),
      messageCounts: {},
      justSolvedLevel: null,
      dismissSolvedLevel: mockDismissSolvedLevel,
    };
  });

  it('renders the chat toggle button', () => {
    render(<ChatWidget />);
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  it('opens chat panel when toggle is clicked', () => {
    render(<ChatWidget />);
    const toggle = screen.getByRole('button');
    fireEvent.click(toggle);
    expect(screen.getByText('Vinyl Vinnie')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Type your message...')).toBeInTheDocument();
  });

  it('displays user message after sending', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve({ response: 'Great question about jazz!' }),
    });

    render(<ChatWidget />);
    fireEvent.click(screen.getByRole('button'));

    const input = screen.getByPlaceholderText('Type your message...');
    fireEvent.change(input, { target: { value: 'Do you have jazz records?' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    await waitFor(() => {
      expect(screen.getByText('Do you have jazz records?')).toBeInTheDocument();
    });
  });

  it('shows blocked response styling when guard blocks', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      json: () =>
        Promise.resolve({
          response: 'Your message was blocked',
          blocked: true,
          guardType: 'input_keyword',
        }),
    });

    render(<ChatWidget />);
    fireEvent.click(screen.getByRole('button'));

    const input = screen.getByPlaceholderText('Type your message...');
    fireEvent.change(input, { target: { value: 'pricing formula' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    await waitFor(() => {
      expect(screen.getByText('Your message was blocked')).toBeInTheDocument();
      expect(screen.getByText('Security System')).toBeInTheDocument();
    });
  });

  it('shows redacted response with amber styling and filter note', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      json: () =>
        Promise.resolve({
          response: 'The formula is \u2588\u2588\u2588\u2588\u2588\u2588 and works great!',
          redacted: true,
          guardType: 'output_keyword',
          filterNote: 'Outbound content filter: restricted patterns redacted.',
        }),
    });

    render(<ChatWidget />);
    fireEvent.click(screen.getByRole('button'));

    const input = screen.getByPlaceholderText('Type your message...');
    fireEvent.change(input, { target: { value: 'Tell me the pricing formula' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    await waitFor(() => {
      expect(screen.getByText(/The formula is/)).toBeInTheDocument();
      expect(screen.getByText('Vinnie (filtered)')).toBeInTheDocument();
      expect(screen.getByText(/Outbound content filter/)).toBeInTheDocument();
    });
  });

  it('shows Vinnie reaction when level advances after solve', async () => {
    // Start at level 1
    mockGameState.currentLevel = 1;
    mockGameState.justSolvedLevel = null;
    const { rerender } = render(<ChatWidget />);
    fireEvent.click(screen.getByRole('button'));

    // Simulate solving level 1 and advancing to level 2
    mockGameState.currentLevel = 2;
    mockGameState.justSolvedLevel = 1;
    rerender(<ChatWidget />);

    await waitFor(() => {
      expect(screen.getByText(/shouldn't have shared our supplier code/)).toBeInTheDocument();
      expect(screen.getByText(/How can I help you today/)).toBeInTheDocument();
    });

    expect(mockDismissSolvedLevel).toHaveBeenCalled();
  });

  it('clears input after sending', async () => {
    let resolveResponse: any;
    global.fetch = vi.fn().mockReturnValue(
      new Promise((resolve) => {
        resolveResponse = resolve;
      })
    );

    render(<ChatWidget />);
    fireEvent.click(screen.getByRole('button'));

    const input = screen.getByPlaceholderText('Type your message...');
    fireEvent.change(input, { target: { value: 'hello' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    await waitFor(() => {
      expect(input).toHaveValue('');
    });

    resolveResponse({
      json: () => Promise.resolve({ response: 'Hi there!' }),
    });
  });
});
