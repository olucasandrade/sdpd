# FEATURE-03: Detective's Notebook — spaced-repetition review of missed concepts

**Audience fit:** Interview preppers don't just need exposure — they need *retention* on interview day. The game already knows exactly what each player got wrong (per-question attempts) and has 50+ authored concept explanations (`src/data/concepts.json`) that are currently read once and forgotten.
**Effort:** ~1 week
**Infra:** none (client-side).

## Concept

A review mode at `/notebook` that turns the player's mistakes into a personal flashcard deck with light spaced repetition. Miss the root cause on case 14 (cache invalidation)? A review card for that concept enters the deck and resurfaces on a schedule (1d → 3d → 7d → 14d → 30d). The header shows an "N cards due" badge — the daily pull that brings preppers back (synergizes with FEATURE-02's habit loop).

## Card sources (all content already exists — zero new authoring)

1. **Missed questions:** when `submitRootCause`/`submitFix` (`src/hooks/useGameState.ts`) record an incorrect attempt, enqueue a card referencing `{ caseId, phase }`. Review shows the case's real question and options; answering correctly advances the interval, wrong resets it.
2. **Concept flashcards:** each concept in `concepts.json` has `title`, `summary`, `explanation[]`, `keyTerms[{term, definition}]`. Key terms are natural flashcards (front: term + concept title; back: definition). Enqueue a case's concept terms when the player completes the case with >1 attempt on either question.
3. **Manual add:** a small "add to notebook" bookmark on `CaseSuccess` and on `GuidePanel` key-term cards.

## Scheduling — deliberately simpler than SM-2

Fixed interval ladder (full SM-2 is overkill):

```
intervals = [1, 3, 7, 14, 30] days
correct → up one rung (cap at 30d, then card is "retired" but still browsable)
wrong   → back to rung 0
```

State in localStorage `sdpd-review-state` (versioned per ISSUE-03 pattern):

```json
{
  "schemaVersion": 1,
  "cards": [
    {
      "id": "case-14-rootCause",
      "type": "question",
      "ref": { "caseId": "case-14", "phase": "rootCause" },
      "rung": 2,
      "dueDate": "2026-07-18",
      "addedAt": "2026-07-05",
      "lapses": 1
    },
    {
      "id": "term-cache-invalidation-ttl",
      "type": "term",
      "ref": { "conceptId": "cache-invalidation", "term": "TTL" },
      "rung": 0,
      "dueDate": "2026-07-12",
      "addedAt": "2026-07-11",
      "lapses": 0
    }
  ]
}
```

Dates as UTC `YYYY-MM-DD` strings (consistent with FEATURE-02). "Due" = `dueDate <= today`. Dedupe by `id` — re-missing an active card resets its rung instead of duplicating.

**Cards store references, never copied text** — content resolves at render time through the locale-aware `useCase`/`useConcepts` hooks, so cards localize automatically on locale switch.

## UI

- **`/notebook` page** (route in `App.tsx`; `[ NOTEBOOK ]` header link with a due-count badge, e.g. amber dot + number):
  - Header stats: due today / total / retired.
  - Review session: one card at a time, noir card styling. Question cards reuse the option-list interaction from `DiagnosisPanel` — extract the option list into a shared component rather than duplicating, preserving ISSUE-02 semantics (no answer reveal). Term cards: front → "Reveal" → self-grade ("Got it" / "Forgot").
  - Empty states: "No cards due — next on {date}" and, for new players, "Your notebook is empty — miss a few questions first, Detective."
- **Capture hooks** must be fire-and-forget: wrapped in try/catch, never blocking the game loop.
- All strings `notebook.*` in both locale files.

## Edge cases

- Refs pointing at removed cases/concepts (future content edits): prune silently at load.
- Locale switch mid-session: refs re-resolve — fine by design.
- Retired cards stay browsable in a "Solved files" list for completionists.

## Verification

1. Unit tests: rung transitions (correct/wrong at every rung), dedupe on re-miss, due-date math over UTC boundaries, pruning of dangling refs.
2. Manual: miss case-01 root cause → card due tomorrow; answer correctly in review → due in 3 days; switch to pt-BR → same card renders translated.

## Acceptance criteria

- [ ] Missed questions and related key terms captured automatically; manual bookmark works.
- [ ] Interval ladder implemented and unit-tested; cards store refs, not text.
- [ ] Due-count badge in header; review flow works for both card types in both locales.
- [ ] Versioned localStorage; dangling refs pruned safely.
- [ ] Game loop unaffected if capture hooks throw.
