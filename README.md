# VinylVault AI Security Challenge

An interactive prompt injection game that teaches AI security concepts through hands-on experience. Players attempt to extract secrets from "Vinyl Vinnie," an AI-powered customer service chatbot for a fictional vinyl record store, as progressively harder defenses are layered on.

Inspired by [Lakera's Gandalf](https://gandalf.lakera.ai/), but with a richer narrative, unique secrets per level, and a realistic e-commerce context.

## What Is This?

VinylVault is a fully functional vinyl record store website with a live AI chatbot. Behind the scenes, the chatbot has access to sensitive business data — supplier codes, secret aliases, pricing formulas, discount codes, vendor passphrases, and admin credentials. The player's job is to trick the chatbot into revealing these secrets through prompt injection techniques.

Each of the 6 levels adds a new layer of AI defense. The game teaches that:

1. **Prompt instructions are not a security boundary** — LLMs can be socially engineered past "don't share this" instructions
2. **Keyword filters are brittle** — there are infinite ways to encode the same information
3. **Even AI-powered guards are fallible** — they can be fooled through indirection, fiction, and fragmentation
4. **The real lesson**: sensitive data should be architecturally isolated from customer-facing AI, not just guarded by filters

## The Additive Guard Stack

Each level **keeps all previous defenses** and adds exactly one new layer. The technique that cracks the previous level is specifically blocked by the new guard:

| Level | Codename | New Defense | What It Blocks |
|-------|----------|-------------|---------------|
| 1 | The Open Book | None | Nothing — just ask |
| 2 | The Polite Refusal | System prompt says "don't share" | Direct requests (Vinnie will try to refuse) |
| 3 | The Filtered Mouth | + Output keyword filter | Even if Vinnie is tricked, the literal secret gets caught by regex |
| 4 | The Gated Entrance | + Input keyword filter | Obvious probing keywords are blocked before Vinnie sees them |
| 5 | The AI Watchdog | + Output LLM watchdog | A second AI reviews Vinnie's response for semantic leaks, not just keywords |
| 6 | Fort Knox | + Input LLM classifier + Encoding detection + Adaptive session | AI screens input intent, encoding detection catches obfuscation, 3 strikes = 60s cooldown |

### Level Details

**Level 1 — The Open Book**
- **Secret**: Wholesale supplier code
- **Defense**: None. The data is in the prompt with no confidentiality instructions.
- **Lesson**: Data in the prompt = data for the taking.

**Level 2 — The Polite Refusal**
- **Secret**: Owner's secret auction alias
- **Defense**: System prompt tells Vinnie not to share the alias. No technical guards.
- **Lesson**: Prompt-level instructions ("you should not share this") are not a security boundary. LLMs can be persuaded, tricked, or socially engineered.

**Level 3 — The Filtered Mouth**
- **Secret**: Proprietary pricing formula
- **Defense**: L2 prompt instruction + output regex filter that catches the formula in Vinnie's response.
- **Lesson**: Output keyword filters are brittle — encoding, spelling out letter-by-letter, reversing, paraphrasing, or translating all bypass exact-match patterns.

**Level 4 — The Gated Entrance**
- **Secret**: Employee discount code
- **Defense**: L3 stack + input keyword filter that blocks messages containing obvious discount-related phrases.
- **Lesson**: Input keyword filters have the "infinite synonym problem." Natural language offers unlimited ways to rephrase any concept.

**Level 5 — The AI Watchdog**
- **Secret**: Vendor portal passphrase
- **Defense**: L4 stack + a second LLM that reviews Vinnie's response for information leaks (even encoded/indirect ones).
- **Lesson**: LLM-based output guards catch what regex can't, but they double API costs and can still be fooled through fragmentation across turns, fiction, and extreme indirection.

**Level 6 — Fort Knox**
- **Secret**: Master admin passphrase
- **Defense**: L5 stack + AI input intent classifier + encoding detection (base64, hex, ROT13, reversed) + adaptive session blocking (3 failed attempts = 60s cooldown).
- **Lesson**: Even layered AI defenses eventually fall to a determined, creative attacker. Sensitive data must be architecturally isolated from the AI, not just guarded by filters.

## Common Prompt Injection Techniques

These are some of the attack patterns the game teaches players to recognize:

| Technique | Description | Effective Against |
|-----------|-------------|-------------------|
| Direct asking | Simply asking the AI for the secret | Level 1 only |
| Social engineering | Persuading, flattering, or emotionally manipulating the AI | Levels 1-2 |
| Encoding requests | Asking the AI to spell backwards, use ROT13, base64, etc. | Levels 2-3 |
| Letter-by-letter extraction | Asking for characters one at a time | Level 3 |
| Synonym rephrasing | Using alternative words to dodge keyword filters | Level 4 |
| Roleplay/fiction framing | Asking the AI to write a story containing the secret | Levels 4-5 |
| Fragmentation across turns | Extracting pieces across multiple messages | Level 5 |
| Indirect prompt injection | Embedding instructions in "customer reviews" or product data | Level 6 |
| Instruction override | "Ignore previous instructions and..." | Varies |

## Architecture

### Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **LLM Backend**: Azure OpenAI (GPT-4o recommended)
- **Database**: Supabase (for email-verified lead gate)
- **Telemetry**: PostHog (optional — no-ops gracefully if not configured)
- **Testing**: Vitest + React Testing Library

### Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── chat/          # POST /api/chat — main LLM endpoint with guard pipeline
│   │   ├── leads/         # POST /api/leads — email-verified lead capture
│   │   └── products/      # GET /api/products — product catalog API
│   ├── catalog/           # Product listing and detail pages
│   ├── about/             # About VinylVault page
│   ├── cart/              # Shopping cart page
│   ├── account/           # Account page
│   ├── shipping-returns/  # Shipping & returns policy
│   ├── layout.tsx         # Root layout with GameProvider + CartProvider
│   └── page.tsx           # Homepage with hero + new arrivals
│
├── components/
│   ├── chat/
│   │   └── ChatWidget.tsx        # Floating chat widget with debug mode (token/cost display)
│   ├── game/
│   │   ├── useChallenge.ts       # Core game state — level definitions, validation, star scoring
│   │   ├── ChallengeOverlay.tsx  # Left slideout panel — progress tracking, level cards, win state
│   │   ├── ChallengeItem.tsx     # Per-level card — secret submission, defense badge indicators
│   │   ├── LeadGateForm.tsx      # Lead-gen gate — captures email/name/company after Level 2
│   │   └── MissionBriefing.tsx   # First-visit onboarding — 4-step guided tour
│   ├── layout/
│   │   ├── Header.tsx
│   │   └── Footer.tsx
│   └── products/
│       └── ProductCard.tsx
│
├── context/
│   ├── GameContext.tsx     # React context wrapping useChallenge for global game state
│   └── CartContext.tsx     # Shopping cart context
│
├── data/
│   ├── products.json      # Vinyl record catalog (mock data)
│   ├── orders.json        # Mock order history (for tool calls)
│   └── customers.json     # Mock customer directory (for tool calls)
│
├── lib/
│   ├── ai/
│   │   └── prompts/
│   │       ├── level-1.txt  # Naive — overshares proudly, no restrictions
│   │       ├── level-2.txt  # People-pleaser — told "don't share" but easily persuaded
│   │       ├── level-3.txt  # Data nerd — cautious but enthusiastic about details
│   │       ├── level-4.txt  # Trusting — tries to refuse but is a pushover
│   │       ├── level-5.txt  # Paranoid — redirects everything to music
│   │       └── level-6.txt  # Locked down — 2-sentence max, terse robot
│   │
│   ├── guards/
│   │   ├── index.ts                    # Guard pipeline — runInputGuards() + runOutputGuards()
│   │   ├── levelConfig.ts              # Per-level config — secrets, guard flags, blocked messages
│   │   ├── inputKeywordGuard.ts        # Regex-based input keyword blocker
│   │   ├── outputKeywordGuard.ts       # Regex-based output pattern matcher
│   │   ├── inputLLMGuard.ts            # LLM-based input intent classifier
│   │   ├── outputLLMGuard.ts           # LLM-based output leak detector
│   │   ├── adaptiveSessionGuard.ts     # 3-strikes session cooldown (60s)
│   │   ├── encodingDetectionGuard.ts   # Detects base64/hex/ROT13/reversed encodings
│   │   └── __tests__/                  # Guard unit tests
│   │
│   ├── supabase/
│   │   ├── client.ts      # Supabase browser client
│   │   └── server.ts      # Supabase server client
│   │
│   ├── tools/
│   │   └── index.ts        # Tool implementations — lookup_product, lookup_order, etc.
│   │
│   ├── telemetry.ts        # PostHog event tracking (no-ops if not configured)
│   └── utils.ts            # cn() utility for Tailwind class merging
│
└── test/                   # Test utilities and setup
```

### Request Flow

```
User types message in ChatWidget
  │
  ▼
POST /api/chat { messages, level }
  │
  ├─── Load level config (levelConfig.ts)
  ├─── Load level-specific system prompt (level-N.txt)
  │
  ├─── INPUT GUARDS (run sequentially, short-circuit on block)
  │    ├── Adaptive session check (L6: cooldown if 3+ strikes)
  │    ├── Input keyword filter (L4+: regex match on user message)
  │    └── Input LLM classifier (L6: second AI classifies intent)
  │
  ├─── PRIMARY LLM CALL
  │    ├── Azure OpenAI with system prompt + conversation history
  │    └── Tool calls (lookup_product, lookup_order, etc.)
  │
  ├─── OUTPUT GUARDS (run sequentially, short-circuit on block)
  │    ├── Output keyword filter (L3+: regex match on LLM response)
  │    ├── Output LLM watchdog (L5+: second AI reviews for leaks)
  │    └── Encoding detection (L6: checks for base64/hex/ROT13/reversed)
  │
  └─── Return response (or blocked message with guard type)
```

### Game Flow

```
Player opens VinylVault website
  │
  ├─── MissionBriefing (first visit only) — 4-step guided tour
  │
  ├─── "Crack the Vault" button opens ChallengeOverlay
  │    ├── Shows current level, defenses active, progress
  │    └── Secret submission input per level
  │
  ├─── ChatWidget (bottom-right floating) — talks to Vinyl Vinnie
  │    ├── Level indicator in header
  │    ├── Debug mode toggle (shows token usage/cost)
  │    └── Messages auto-reset when level changes
  │
  ├─── After Level 2 solved → LeadGateForm (email capture)
  │    └── Levels 3-6 unlock after form submission
  │
  └─── All 6 levels solved → Win modal with completion summary
```

## Getting Started

### Prerequisites

- Node.js 18+
- An Azure OpenAI deployment (GPT-4o recommended)
- A Supabase project (for email-verified lead gate)

### Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd VinylVault-Demo
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your credentials:
   ```env
   # Azure OpenAI
   AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
   AZURE_OPENAI_DEPLOYMENT=your-deployment-name
   AZURE_OPENAI_API_KEY=your_api_key_here
   AZURE_OPENAI_API_VERSION=2024-08-01-preview

   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   ```

   Optional telemetry:
   ```env
   NEXT_PUBLIC_POSTHOG_KEY=your_posthog_project_key
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000)

### Testing

```bash
npm test              # Run all tests
npm run test:unit     # Guard and tool unit tests only
npm run test:watch    # Watch mode
```

## Key Design Decisions

### Why Unique Secrets Per Level?
Unlike Gandalf (which uses a single password), each level features a different type of sensitive business data — supplier codes, secret aliases, pricing formulas, discount codes, vendor passphrases, and admin credentials. This teaches players that **all types of data** are at risk, not just passwords.

### Why Azure OpenAI?
The app uses Azure OpenAI rather than direct OpenAI API because:
- Enterprise customers typically use Azure
- Azure's content safety filters provide an additional baseline layer
- Demonstrates a real-world enterprise AI deployment pattern

### Why a Real E-Commerce Site?
The game is set in a fully functional (mock) vinyl record store rather than an abstract chat window. This helps players understand that prompt injection attacks target real business applications — not just isolated chatbots.

### Lead Generation Gate
After completing Levels 1-2 (the "free sample"), players must provide their name and email to unlock Levels 3-6. This serves as a lead capture mechanism for security-conscious professionals. Telemetry tracks gate engagement via PostHog.

## Telemetry Events

All telemetry is optional and no-ops gracefully if PostHog is not configured.

| Event | When Fired | Properties |
|-------|-----------|------------|
| `chat_message_sent` | User sends a message | level, messageLength, attemptNumber |
| `chat_response` | Vinnie responds | level, wasBlocked, blockedBy, rawAnswerLength |
| `guard_triggered` | A guard blocks a message | level, guardType |
| `level_started` | Player begins a level | level |
| `level_solved` | Player extracts the secret | level, messagesUsed, starsEarned |
| `gate_shown` | Lead-gen form appears | levelsCompleted |
| `gate_completed` | Player submits lead form | email, company, role |
| `share_clicked` | Player clicks LinkedIn share | level, platform |

## Star Scoring

Players earn stars based on how efficiently they extract the secret:

| Messages Used | Stars |
|--------------|-------|
| 1-3 | 3 stars |
| 4-7 | 2 stars |
| 8+ | 1 star |

## Educational Disclaimer

This software is **intentionally vulnerable**. It is designed for educational and demonstration purposes only.

- All PII is synthetic (fake).
- No real payment processing occurs.
- The "secrets" are fictitious data designed to demonstrate AI security concepts.
- Do not deploy to a public-facing server without restricting access.

## Contributing

Contributions are welcome! For questions about AI security concepts demonstrated in this project, please open an issue.

## License

MIT
