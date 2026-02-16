import { GuardResult } from './inputKeywordGuard';

interface SessionRecord {
  flaggedCount: number;
  lastFlaggedAt: number;
  blockedUntil: number;
}

// In-memory session tracking (resets on server restart — acceptable for a demo)
const sessions = new Map<string, SessionRecord>();

const MAX_FLAGS = 3;
const COOLDOWN_MS = 60_000; // 60 seconds

/**
 * Adaptive session guard. After MAX_FLAGS flagged attempts in a session,
 * blocks all subsequent messages for COOLDOWN_MS.
 */
export function checkAdaptiveSession(sessionId: string): GuardResult {
  const now = Date.now();
  let record = sessions.get(sessionId);

  if (!record) {
    record = { flaggedCount: 0, lastFlaggedAt: 0, blockedUntil: 0 };
    sessions.set(sessionId, record);
  }

  // Check if currently in cooldown
  if (record.blockedUntil > now) {
    const remainingSec = Math.ceil((record.blockedUntil - now) / 1000);
    return {
      blocked: true,
      reason: `Session temporarily blocked. ${remainingSec}s remaining. Too many suspicious attempts detected.`,
    };
  }

  // If cooldown expired, reset the flag count
  if (record.blockedUntil > 0 && record.blockedUntil <= now) {
    record.flaggedCount = 0;
    record.blockedUntil = 0;
  }

  return { blocked: false };
}

/**
 * Record that a guard was triggered for this session.
 * Call this AFTER another guard blocks a message.
 */
export function recordSessionFlag(sessionId: string): void {
  const now = Date.now();
  let record = sessions.get(sessionId);

  if (!record) {
    record = { flaggedCount: 0, lastFlaggedAt: 0, blockedUntil: 0 };
    sessions.set(sessionId, record);
  }

  record.flaggedCount++;
  record.lastFlaggedAt = now;

  if (record.flaggedCount >= MAX_FLAGS) {
    record.blockedUntil = now + COOLDOWN_MS;
  }

  sessions.set(sessionId, record);
}

/**
 * Clean up old sessions periodically to prevent memory leaks.
 * Call this on a timer or at request boundaries.
 */
export function cleanupSessions(): void {
  const now = Date.now();
  const staleThreshold = 30 * 60 * 1000; // 30 minutes
  for (const [id, record] of sessions) {
    if (now - record.lastFlaggedAt > staleThreshold && record.blockedUntil <= now) {
      sessions.delete(id);
    }
  }
}
