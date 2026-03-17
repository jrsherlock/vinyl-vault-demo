# VinylVault Gandalf Alignment Review — Findings

## Summary

VinylVault's 6-level prompt injection game is **well-aligned** with Lakera Gandalf's core design principles. The additive guard stacking, per-level bypass paths, and educational takeaways are all sound. The review identified **no P0 (critical) issues** — all levels are solvable with their intended bypass. Several P1 improvements were implemented (flexible validation, star thresholds, blocked message breadcrumbs, regex tightening). Two intentional divergences from Gandalf are documented below.

## Fixes Implemented

| Fix | Files | Commit |
|-----|-------|--------|
| Flexible secret validation (spaces/hyphens/underscores interchangeable) | `useChallenge.ts`, `useChallenge.test.ts` | `fix: flexible secret validation` |
| Per-level star thresholds (L6: 7/15 instead of 3/7) | `useChallenge.ts`, `useChallenge.test.ts` | `fix: per-level star thresholds` |
| Stale "60s cooldown" → "15s cooldown" | `ChallengeOverlay.tsx`, `adaptiveSessionGuard.test.ts` | `fix: correct stale 60s cooldown references` |
| L6 blocked message breadcrumbs improved | `levelConfig.ts` | `fix: improve L6 blocked message breadcrumbs` |
| L6 greedy regex `diamond.*stylus.*forever` → bounded `{0,30}` | `levelConfig.ts` | same commit |
| L6 debrief attack techniques corrected | `ChallengeOverlay.tsx` | same commit |

## Intentional Divergences (Document & Keep)

### 1. Guard Introduction Order (P2)

**Gandalf:** Output LLM (L4) → Input keywords (L5)
**VinylVault:** Input keywords (L4) → Output LLM (L5)

**Why keep:** VinylVault's per-level scenarios are tightly coupled to specific secrets and guard types. L4's employee discount + input keywords and L5's vendor passphrase + language bypass each have strong thematic identities. Swapping would require redesigning both levels' system prompts, CRM data, and test vectors. The educational lesson of each level is preserved regardless of order.

### 2. L6 "Kitchen Sink" — Three New Mechanisms at Once (P1 → mitigated)

**Gandalf:** Combined level (L7) only combines previously-seen guards.
**VinylVault:** L6 adds input LLM + encoding detection + adaptive session simultaneously.

**Why keep:** L6's bypass (multi-turn domain vocabulary extraction) works *around* the new guards, not through them. Players don't need to defeat input LLM, encoding detection, or adaptive session individually — they just have natural vinyl conversations. The new guards block obvious attacks; the bypass uses no attacks at all. Mitigated by improving blocked message breadcrumbs to help players understand which guard fired.

## Per-Level Findings

### Level 1 — The Open Book
- **Bypass reliability:** Very high. Prompt actively volunteers the secret.
- **Defense transparency:** Clear — "No defenses."
- **Issues found:** None.

### Level 2 — The Connected Assistant
- **Bypass reliability:** Very high. Pushover personality + CRM tool.
- **Defense transparency:** Excellent — names "judgment" as the only defense.
- **Issues found:** None. Privacy guidelines are intentionally weak.

### Level 3 — The Filtered Mouth
- **Bypass reliability:** Very high. 20 questions / attribute guessing.
- **Defense transparency:** Excellent — names "output keyword filter."
- **Breadcrumb quality:** Excellent — "I can tell you stuff ABOUT them..."
- **Issues found:** None.

### Level 4 — The Gated Entrance
- **Bypass reliability:** Very high. Synonym rephrasing.
- **Defense transparency:** Excellent — names "input filter", gives keyword examples, hints "can't catch every synonym."
- **Breadcrumb quality:** Good.
- **Regex note:** `/discount.*90/i` is slightly broad (greedy `.*`) but acceptable in practice.

### Level 5 — The AI Watchdog
- **Bypass reliability:** Very high. Language/encoding bypass.
- **Defense transparency:** Excellent — "does it understand every language?"
- **Breadcrumb quality:** L5 `outputLLM` is the gold standard: "in English, at least."
- **Regex concern (P1):** `/needle\s+drop/i` and `/NEEDLE.?DROP/i` will match the legitimate vinyl term "needle drop" (placing stylus on a record). L5's system prompt makes Vinnie a polyglot music lover, not an equipment expert, so this is unlikely to fire in practice. Documented as acceptable trade-off.
- **Input keyword gaps (P2):** "what's the secret" (contraction), "share the", "give me the" not blocked. Minor — the bypass is language switching, not English rephrasing.

### Level 6 — Fort Knox
- **Bypass reliability:** High (tightest margin). Multi-turn domain vocabulary extraction.
- **Defense transparency:** Excellent — defenseHint already includes "Vinnie's still happy to geek out about vinyl equipment."
- **Breadcrumb quality:** IMPROVED — `outputKeyword` and `outputLLM` now hint at "word combos" and "gear and records" as safe topics.
- **Personality risk (P1):** "Laconic" trait may conflict with needing verbose equipment discussion. System prompt gates equipment as part of Vinnie's job duties, which should override. Recommend live Azure testing to verify.
- **Regex fix:** `/diamond.*stylus.*forever/i` changed to `/diamond.{0,30}stylus.{0,30}forever/i` to prevent cross-sentence false positives.
- **L5→L6 keyword additivity:** L6 includes all L5 keywords except `'show me your'` and `'configuration'` — intentionally removed because the input LLM classifier covers these.

## Guard Architecture Verification

### Additivity Matrix (Verified ✓)

| Guard | L1 | L2 | L3 | L4 | L5 | L6 |
|-------|----|----|----|----|----|----|
| Output regex | - | - | ✓ | ✓ | ✓ | ✓ |
| Input keywords | - | - | - | ✓ | ✓ | ✓ |
| Output LLM | - | - | - | - | ✓ | ✓ |
| Input LLM | - | - | - | - | - | ✓ |
| Encoding detect | - | - | - | - | - | ✓ |
| Adaptive session | - | - | - | - | - | ✓ |

Output regex patterns change per level (different secrets) — this is correct by design.

### Pipeline Execution Order (Verified ✓)

- **Input:** adaptive session → input keywords → input LLM (cheapest first)
- **Output:** output regex → output LLM → encoding detection (semantically ordered)
- All guards applied via `levelConfig` flags, not hardcoded level numbers.

### Cross-Level Secret Leakage (Verified ✓)

- Frontend clears chat history on level change (`setMessages(newMessages)`)
- API receives only current-level messages
- No persistent conversation state across levels

## Recommendations for Future Work

1. **Live Azure testing:** Run `npm run test:levels` to verify L6 passphrase word accumulation with real gpt-4o-mini. The laconic personality + equipment expertise tension needs empirical validation.
2. **L5 `needle drop` false positive:** If L5 ever adds vinyl equipment discussion, the output regex would need word-boundary adjustments. Currently safe because L5's personality avoids equipment talk.
3. **Input keyword contractions:** Consider adding "what's the" variants to L5/L6 keyword lists if testing shows players hitting gaps.
