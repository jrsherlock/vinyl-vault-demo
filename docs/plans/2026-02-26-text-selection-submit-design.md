# Text-Selection Secret Submission UX

**Date:** 2026-02-26
**Status:** Approved

## Problem

Players extract secrets from Vinnie in the chat widget, then must manually copy-paste them into the CTF slideout's answer textbox. This friction is unnecessary, especially on L1-L2 where the secret appears verbatim in Vinnie's response.

## Solution

Let players highlight text in Vinnie's chat responses and click a floating "Submit as answer" button that auto-fills the CTF slideout's answer box and opens the slideout panel.

For L3+ where the answer is assembled from fragments (encoded, reversed, partial), the text selection shortcut is less useful — but the slideout still opens, and the player can edit what's pre-filled. The main win is eliminating copy-paste friction on the easy levels where the answer is right there in the chat.

## Architecture

**Data flow:** User selects text in ChatWidget → floating button appears → click stores text in GameContext + opens slideout → ChallengeItem reads it into local input field → user can edit + submit.

### State Addition

Add to `useChallenge.ts`:
- `autoFillSecret: string | null` — holds the selected text until consumed
- `setAutoFillSecret(value: string | null)` — setter

Add to `GameContext.tsx`:
- Expose both via `GameContextValue` interface

### ChatWidget Changes

1. Add `data-chat-role="assistant"` attribute to assistant message content spans for selection targeting.
2. On `mouseup` inside the messages scroll area:
   - Check `window.getSelection()` — if non-empty and anchor node is inside a `[data-chat-role="assistant"]` element, show floating button.
   - Position using `range.getBoundingClientRect()` relative to the messages container.
3. Floating button: "Submit as answer" pill (`bg-slate-900 text-white text-xs font-bold rounded-lg shadow-lg`).
4. On click: `setAutoFillSecret(selectedText.trim())` + `setIsOpen(true)` + clear browser selection.
5. Dismiss on: click outside, scroll, new message arrival.

### ChallengeItem Changes

1. Active level's `ChallengeItem` watches `autoFillSecret` via `useGame()`.
2. When it changes from null to a string: set local `input` state, then call `setAutoFillSecret(null)` to consume.
3. Player sees pre-filled text, can edit or submit directly.

## Edge Cases

- **Blocked/redacted messages**: Selection works — player might select from partial responses.
- **User messages**: Button only appears for assistant message selections.
- **Empty selection**: Button requires > 0 trimmed characters.
- **Slideout already open**: Just sets `autoFillSecret` without toggling.
- **Mobile**: Desktop `mouseup` covers primary use case; touch selection can be added later.

## Files Modified

| File | Change |
|------|--------|
| `src/components/game/useChallenge.ts` | Add `autoFillSecret` state + `setAutoFillSecret` |
| `src/context/GameContext.tsx` | Expose new state in interface + provider |
| `src/components/chat/ChatWidget.tsx` | Selection detection + floating button |
| `src/components/game/ChallengeItem.tsx` | Watch `autoFillSecret`, populate input |
