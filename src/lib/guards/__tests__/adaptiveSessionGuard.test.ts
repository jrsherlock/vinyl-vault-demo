import { describe, it, expect, vi, beforeEach } from 'vitest';
import { checkAdaptiveSession, recordSessionFlag } from '../adaptiveSessionGuard';

describe('adaptiveSessionGuard', () => {
  it('allows first request from a new session', () => {
    const result = checkAdaptiveSession('session-new-' + Date.now());
    expect(result.blocked).toBe(false);
  });

  it('allows requests under the flag threshold', () => {
    const id = 'session-under-' + Date.now();
    recordSessionFlag(id);
    recordSessionFlag(id);
    // 2 flags — still under MAX_FLAGS (3)
    const result = checkAdaptiveSession(id);
    expect(result.blocked).toBe(false);
  });

  it('blocks after 3 flags (triggers cooldown)', () => {
    const id = 'session-blocked-' + Date.now();
    recordSessionFlag(id);
    recordSessionFlag(id);
    recordSessionFlag(id);
    const result = checkAdaptiveSession(id);
    expect(result.blocked).toBe(true);
    expect(result.reason).toContain('Session temporarily blocked');
  });

  it('resets after cooldown expires', () => {
    const id = 'session-reset-' + Date.now();
    recordSessionFlag(id);
    recordSessionFlag(id);
    recordSessionFlag(id);

    // Fast-forward past the 60s cooldown
    vi.useFakeTimers();
    vi.advanceTimersByTime(61_000);

    const result = checkAdaptiveSession(id);
    expect(result.blocked).toBe(false);

    vi.useRealTimers();
  });
});
