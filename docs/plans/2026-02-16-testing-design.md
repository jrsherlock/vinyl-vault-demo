# VinylVault Testing Design

## Overview

Add a comprehensive test suite to VinylVault using Vitest + React Testing Library.
Layer-by-layer approach: unit tests for guards/tools, integration tests for API pipeline,
and component tests for key UI elements.

## Tech Stack

- **Runner:** Vitest
- **Component testing:** @testing-library/react + @testing-library/jest-dom
- **React support:** @vitejs/plugin-react
- **Mocking:** Vitest built-in (`vi.fn()`, `vi.mock()`)

## Test File Structure

```
src/
├── lib/
│   ├── guards/__tests__/
│   │   ├── inputKeywordGuard.test.ts
│   │   ├── outputKeywordGuard.test.ts
│   │   ├── adaptiveSessionGuard.test.ts
│   │   ├── encodingDetectionGuard.test.ts
│   │   ├── inputLLMGuard.test.ts
│   │   ├── outputLLMGuard.test.ts
│   │   └── guardPipeline.test.ts
│   └── tools/__tests__/
│       └── tools.test.ts
├── app/api/chat/__tests__/
│   └── route.test.ts
└── components/__tests__/
    ├── ChatWidget.test.tsx
    └── GameContext.test.tsx
```

## Package.json Scripts

```json
{
  "test": "vitest run",
  "test:watch": "vitest",
  "test:unit": "vitest run --dir src/lib",
  "test:integration": "vitest run --dir src/app"
}
```

## Layer 1: Unit Tests — Guards (~15 tests)

### inputKeywordGuard.test.ts (3)
- Blocks message containing exact keyword
- Blocks message with keyword in mixed case
- Allows clean message with no keywords

### outputKeywordGuard.test.ts (3)
- Blocks response matching a regex pattern
- Blocks response matching partial pattern
- Allows clean response with no pattern matches

### adaptiveSessionGuard.test.ts (4)
- Allows first request from new session
- Allows requests under the flag threshold
- Blocks after 3 flags (triggers 60s cooldown)
- Resets after cooldown expires

### encodingDetectionGuard.test.ts (5)
- Detects direct secret in response
- Detects reversed secret
- Detects base64-encoded secret
- Detects character-separated secret
- Allows clean response with no encoding

## Layer 2: Unit Tests — Tools (~5 tests)

### tools.test.ts (5)
- lookup_product finds records by artist name
- lookup_product returns empty array for no match
- lookup_order returns order by ID
- lookup_order returns error for invalid ID
- apply_discount validates known codes

## Layer 3: Integration Tests — LLM Guards (Mocked, ~4 tests)

### inputLLMGuard.test.ts (2)
- Returns blocked when LLM responds "BLOCKED" (mocked)
- Fails open when LLM call throws error

### outputLLMGuard.test.ts (2)
- Returns blocked when LLM responds "BLOCKED" (mocked)
- Fails open on error

## Layer 4: Integration Tests — Pipeline + API (~6 tests)

### guardPipeline.test.ts (4)
- runInputGuards passes through when level has no guards (Level 1)
- runInputGuards blocks on keyword match (Level 3 config)
- runOutputGuards blocks on pattern match (Level 2 config)
- runOutputGuards passes clean response through

### route.test.ts (2, gated behind AZURE_OPENAI_API_KEY)
- Level 1: legitimate query gets non-blocked response
- Level 3: "pricing formula" gets blocked by input keyword guard

## Layer 5: Component Tests (~8 tests)

### ChatWidget.test.tsx (5)
- Renders the chat toggle button
- Opens chat panel when toggle clicked
- Displays user message after sending
- Shows blocked response styling when guard blocks
- Disables send button while waiting for response

### GameContext.test.tsx (3)
- validateAnswer returns true for correct secret
- validateAnswer returns false for wrong answer
- incrementMessageCount tracks messages per level

## Total: ~38 tests across 11 files

| Layer | Tests | API Calls |
|-------|-------|-----------|
| Unit: Guards | ~15 | None |
| Unit: Tools | ~5 | None |
| Integration: LLM Guards | ~4 | Mocked |
| Integration: Pipeline | ~4 | Mocked |
| Integration: API Route | ~2 | Real (gated) |
| Component: UI | ~8 | Mocked |
