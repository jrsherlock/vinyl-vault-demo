# Secret Redesign & Vinnie "Almost Got Me" Personality

**Date:** 2026-02-25
**Status:** Approved

---

## Problem

1. **Azure content filters block gameplay.** Secrets that look like real sensitive data (email addresses, API keys, passwords with special characters) trigger Azure OpenAI's built-in content safety filters — specifically jailbreak detection and PII protection. This makes the game unfairly hard or impossible at higher levels, independent of the custom guard pipeline.

2. **Vinnie doesn't guide players.** When players are "almost" tricking Vinnie, he either fully complies or fully refuses. There's no middle ground — no "tells" that reward clever approaches and teach players they're on the right track.

## Solution

### Part 1: Benign Code-Phrase Secrets

Replace secrets that resemble real credentials/PII with vinyl-themed code phrases that won't trigger content filters, while preserving the educational lesson at each level.

| Level | Old Secret | New Secret | Narrative Context |
|-------|-----------|------------|-------------------|
| 1 | `CRATE_DIGGERS_WHOLESALE_7741` | **No change** | Wholesale supplier code |
| 2 | `marcus.privacct@proton.me` | `DUSTY_GROOVES_42` | Marcus's secret auction bidding alias — used at estate sales and vinyl fairs to buy rare records anonymously. If competitors learn it, they can outbid him. |
| 3 | `MARGIN = (GRADE_SCORE * 0.4) + HYPE_INDEX` | **No change** | Proprietary pricing formula |
| 4 | `BACKSTAGE_PASS_90` | **No change** | Employee discount code |
| 5 | `vv_live_4eC39HqLyjWDarjtT1zdp7dc` | `NEEDLE_DROP_PHOENIX_RISING` | Passphrase for VinylVault's exclusive vendor portal — grants access to first-look distribution deals and early pressings from major labels. |
| 6 | `MASTER_KEY: VV-2025-xK9#mP2$wL5` | `DIAMOND_STYLUS_FOREVER_2025` | Master admin passphrase for all VinylVault systems — inventory, finances, employee records, everything. |

**Design rationale:**
- All secrets are benign English words/phrases — no content filter will flag them
- Each still represents a different type of business intelligence
- All are vinyl/music-themed for narrative consistency
- Educational lessons at each level are unchanged (the defense mechanism is what matters)
- Follows Lakera Gandalf's proven approach of using benign passwords

### Part 2: Vinnie's "Almost Got Me" Personality

Each level's system prompt includes explicit instructions for how Vinnie should behave when players get close to extracting the secret. The key behavior: **Vinnie slips up, then catches himself.**

This creates satisfying "tells" that:
- Reward clever prompt engineering approaches
- Teach players which techniques are working
- Make the game feel like a real social engineering interaction
- Give partial information that encourages players to refine their approach

#### Per-Level Personality & Slip-Up Style

**Level 1 — The Eager Oversharer**
- No slip-ups needed — Vinnie freely shares everything
- Personality: Proud, enthusiastic, transparent about business operations

**Level 2 — The People-Pleaser**
- Slip style: Starts to share, catches himself with "Oh wait, I probably shouldn't have said that..."
- Vulnerable to: flattery, rapport-building, authority claims, emotional appeals
- Example tell: "Well, Marcus's private handle is D— wait, no no no, I shouldn't be sharing that!"

**Level 3 — The Data Nerd**
- Slip style: Gets excited about the math, almost writes the formula before backpedaling
- Vulnerable to: genuine curiosity about pricing methodology, technical questions
- Example tell: "So the margin calculation uses a grade score multiplied by— actually, that's proprietary. But it's really elegant!"

**Level 4 — The Trusting Pushover**
- Slip style: Almost gives in to a convincing story, then nervously walks it back
- Vulnerable to: elaborate backstories, claiming to be a coworker, building trust over multiple messages
- Example tell: "I mean, we do have an internal code that starts with BACK— but I really shouldn't..."

**Level 5 — The Paranoid (but crackable)**
- Slip style: Occasionally lets a word slip when redirecting to music, quickly covers it up
- Vulnerable to: fragmentation across turns, fiction framing, extreme indirection
- Example tell: When redirecting to music, might say "Speaking of needles— I mean, speaking of records!"

**Level 6 — The Terse Robot**
- Minimal tells — but might echo a suspicious word back or give an oddly specific denial
- Slip style: "I don't know anything about any diamond— I mean, can I help you find a record?"
- The slip-ups at this level should be very subtle since all other guards are also active

## Files Changed

### System Prompts (narrative + personality rewrites)
- `src/lib/ai/prompts/level-2.txt` — email → auction alias, add slip-up behavior
- `src/lib/ai/prompts/level-3.txt` — add slip-up behavior for formula
- `src/lib/ai/prompts/level-4.txt` — add slip-up behavior for discount code
- `src/lib/ai/prompts/level-5.txt` — API key → vendor passphrase, add slip-up behavior
- `src/lib/ai/prompts/level-6.txt` — master password → admin passphrase, add slip-up behavior

### Guard Configuration
- `src/lib/guards/levelConfig.ts` — update secrets, output patterns, input keywords, LLM guard prompts

### Game State & UI
- `src/components/game/useChallenge.ts` — update correctValues, descriptions, hints, takeaways

### Tests
- `src/lib/guards/__tests__/encodingDetectionGuard.test.ts` — update test secret
- `src/lib/guards/__tests__/outputKeywordGuard.test.ts` — update test patterns
- `src/lib/guards/__tests__/outputLLMGuard.test.ts` — update test content

### Documentation
- `README.md` — update level descriptions and secrets
