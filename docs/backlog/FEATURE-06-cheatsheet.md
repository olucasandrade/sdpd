# FEATURE-06: System Design Cheatsheet — a reference page of "When X → use Y, why / or use M, why" decision cards

**Audience fit:** Interview preppers cram from decision tables the night before an interview. A scannable, situation-indexed cheatsheet is the single most-shared artifact in this space — it doubles as an SEO/social entry point that funnels new players into the game.
**Effort:** ~3–5 days. **The content is already written** — 45 cards in `src/data/cheatsheet/en.json`. This doc is UI + wiring + translation.
**Infra:** none.

## Design decisions (settled with the owner — do not relitigate)

These were resolved in a grilling session; implement exactly as stated:

1. **Reference-first, not a quiz.** The page is a scannable reference. No gamification, no progress tracking, no gating of any kind — fully open even to a first-time visitor with zero cases completed.
2. **Tabs per category** (owner's explicit choice over a single scrolling page). Exactly the 8 existing game categories, using the same `category.*` i18n keys the Home page uses: replication, consistency, loadBalancing, caching, messaging, storage, network, advanced. Interview staples that don't map 1:1 to a category (e.g. rate limiting, CDN) are folded into the nearest tab — already done in the dataset.
3. **Global search overlay.** A search field sits above the tabs. While the query is non-empty, the tab panel is replaced by a flat cross-category results list; each result shows a small category chip. Clicking a result clears into that category's tab, scrolls to the card, and briefly highlights it. Clearing the query returns to the previously active tab.
4. **No print stylesheet in v1.** Explicitly skipped by the owner; do not add one.
5. **EN content is authored and vetted** (`src/data/cheatsheet/en.json`, 45 cards). Do **not** rewrite, "improve", or add cards — the technical claims were deliberately hand-checked. Your content tasks are translation and cross-linking only (see Content tasks).

## The card format

Each card answers one recurring interview decision. Rendered structure:

```
┌─ [category chip]                        ─┐
│ TITLE (the decision, e.g. "Sync vs      │
│ async replication")                     │
│                                         │
│ WHEN: <the situation trigger>           │
│                                         │
│ → USE <option 1>                        │
│   why: <≤2 sentences>                   │
│ → OR USE <option 2>                     │
│   why: <≤2 sentences>                   │
│                                         │
│ ⚖ TRADEOFF: <the axis you're trading>   │
│ 🗣 INTERVIEWER WILL ASK: <probe>         │
│                                         │
│ [Investigate: Case 14 →]  (if linked)   │
└─────────────────────────────────────────┘
```

Dataset schema (already in `en.json`; `pt-BR.json` must match exactly):

```json
{
  "schemaVersion": 1,
  "cards": [
    {
      "id": "cache-stampede",
      "category": "caching",
      "title": "…",
      "when": "…",
      "options": [ { "use": "…", "why": "…" } ],
      "tradeoff": "…",
      "interviewerProbe": "…",
      "relatedCaseIds": ["case-16"],
      "conceptId": null
    }
  ]
}
```

- `options` has 2–3 entries — always render all of them with an "OR" visual separator; the whole point is showing the fork, not a single answer.
- `relatedCaseIds` → render as "Investigate this in Case N" link(s) to `/case/:caseId`. This is the funnel from reference reader to player. If empty, omit the footer row.
- `conceptId` → reserved for linking into the Guide/concept system; if null, ignore. Do not invent UI for it in v1 beyond storing it.
- `interviewerProbe` is the follow-up question a real interviewer would ask; style it distinctly (the noir "interrogation" flavor fits — e.g. a typewriter-style line prefixed with a `>` or stamped label).

## Content tasks (the only content work)

1. **Translate to pt-BR:** create `src/data/cheatsheet/pt-BR.json` with identical structure, ids, categories, and links — translate only `title`, `when`, `options[].use` (keep canonical tech terms in English where Brazilian devs use them: "cache", "leader", "quorum", "fan-out"…), `options[].why`, `tradeoff`, `interviewerProbe`. The owner is a native speaker and will review; flag any sentence you were unsure about in the PR description.
2. **Fill `relatedCaseIds` and `conceptId` in BOTH files:** only `spof` is linked (`case-01`) as an example. For each card, read the case files in the card's category range — replication 1–3, consistency 4–8, loadBalancing 9–13, caching 14–17, messaging 18–21, storage 22–25, network 26–29, advanced 30–33 (`src/data/cases/case-NN.json`, EN versions suffice) — and link cases whose root cause or fix exercises the card's decision. 0–2 links per card; **do not force a link** where none genuinely fits. Set `conceptId` when a case's `conceptId` field matches the card's topic; otherwise leave null.

## Implementation

### Data loading

Follow the ISSUE-07 lazy-loading pattern — do **not** eagerly import both locales:

```ts
// src/hooks/useCheatsheet.ts
const loaders = import.meta.glob<{ default: CheatsheetData }>('../data/cheatsheet/*.json');
// key by useGameState().locale, fallback to 'en'; cache the parsed result in module scope
```

Define `CheatsheetData` / `CheatsheetCard` types in `src/types/cheatsheet.ts` mirroring the schema above. Validate `schemaVersion === 1` and render a plain error state on mismatch rather than crashing.

### Page structure — `src/pages/CheatsheetPage.tsx`

- Route: `/cheatsheet` in `src/App.tsx`, inside the existing `GameLayout` route (per backlog cross-cutting rule 4).
- Header: `[ CHEATSHEET ]` nav link in `src/components/layout/Header.tsx` alongside existing links.
- Home: one promo card on `HomePage.tsx` ("The Detective's Field Manual — every call you'll make under pressure, indexed").
- Layout: page title + one-line subtitle, search field, tab bar (8 tabs, `category.*` labels), then a responsive card grid (1 col mobile, 2 cols ≥768px, 3 cols ≥1280px is optional — cards are text-dense, don't cram).
- Tab state also drives the URL (see Deep links) so refresh preserves the active tab.

### Search behavior (exact spec)

- Client-side substring match, case-insensitive, against: `title`, `when`, every `options[].use` and `options[].why`, `tradeoff`. Match across **all** categories regardless of active tab.
- Non-empty query → replace tab panel with a flat results list (same card component, plus category chip). Show a count ("7 leads found") and an empty state in noir voice ("No leads. Try another angle, detective.").
- Result click → set active tab to the card's category, clear the query, scroll the card into view, apply a ~2s highlight (e.g. temporary `ring` class; respect `prefers-reduced-motion` — no animated pulse, just a static highlight that times out).
- Clearing the query (including Escape) restores the previously active tab and its scroll position if feasible (restoring scroll is nice-to-have, not acceptance-blocking).
- Debounce ~150ms; 45 cards means no indexing library — plain `Array.filter` is correct, do not add a dependency.

### Deep links

- Canonical form: `/cheatsheet?tab=caching&card=cache-stampede`. On load: activate `tab` (fallback: first tab), and if `card` is present scroll to + highlight it. Keep `tab` in the URL via `useSearchParams` on tab change; only write `card` on deep-link arrival or result click — don't churn history on every scroll.
- Each card gets `id={card.id}` for anchor targeting. These URLs are the shareable unit ("here's the card on cache stampede").

### i18n

All UI chrome strings under `cheatsheet.*` in **both** `src/i18n/locales/en.json` and `pt-BR.json`: page title, subtitle, search placeholder, results count, empty state, "when"/"use"/"or use"/"why"/"tradeoff"/"interviewer will ask" labels, "Investigate in Case {n}" link text, promo card text, header link. Card *content* comes from the dataset files, never from the locale files.

### Styling

Noir language per existing components: tokens from `src/index.css` `@theme`, card chrome matching the case-file/dossier patterns already in `src/components/game/`. The cheatsheet should read as "the department's field manual" — same paper/ink/stamp vocabulary, no new visual system.

### Accessibility (per ISSUE-06 standards)

- Tabs: proper `role="tablist"`/`tab`/`tabpanel` with arrow-key navigation and `aria-selected`.
- Search: `role="search"`, results list keyboard-navigable (arrow keys or plain tab order is fine), result activation with Enter.
- The highlight-on-jump must not rely on color alone (use the ring/outline, and move focus to the card container with `tabIndex={-1}`).

## SEO note (cheap, do it)

This page is the most linkable thing in the product. Give the route a proper `<title>` ("System Design Cheatsheet — SDPD") and meta description (coordinate with ISSUE-07's OG work; if ISSUE-07 hasn't landed, a `useEffect` title-setter is acceptable for v1).

## Out of scope for v1 (recorded so nobody "helpfully" adds them)

- Print stylesheet / PDF export (explicitly declined).
- Per-card progress, bookmarking, or spaced repetition (FEATURE-03's territory).
- Quiz mode on cheatsheet content.
- Authoring new cards or editing existing card text.

## Verification

1. `/cheatsheet` renders all 8 tabs; every tab shows its cards (5–6 each, 45 total); no card appears twice.
2. Search "stampede" from the replication tab → flat results with caching chip → click → lands on caching tab, card highlighted; Escape/clear returns to replication tab.
3. Deep link `/cheatsheet?tab=messaging&card=backpressure` in a fresh session scrolls to and highlights the card.
4. Locale switch swaps card content without reload; network tab shows only the active locale's JSON chunk loaded.
5. Keyboard-only pass: reach tabs, arrow between them, search, navigate results, activate one.
6. Every `relatedCaseIds` link opens a valid case; no link 404s.
7. `npm run lint` and `npm run build` pass; both locale datasets have identical card ids/categories (add a small Vitest test asserting this parity — it's the regression that will actually happen).

## Acceptance criteria

- [ ] `/cheatsheet` route under GameLayout, header link, Home promo card.
- [ ] 8 category tabs using `category.*` keys; 45 cards rendered from the dataset (content untouched).
- [ ] Global search overlay per spec: flat cross-category results, chip, jump + highlight, clear-restores-tab.
- [ ] Deep links `?tab=&card=` work on cold load.
- [ ] `pt-BR.json` dataset complete and structurally identical; parity unit test in Vitest.
- [ ] `relatedCaseIds`/`conceptId` filled per the case-range mapping; every link valid.
- [ ] Lazy per-locale loading (`import.meta.glob`); no eager double-locale bundle.
- [ ] All chrome strings `cheatsheet.*` in both locales; a11y tab/search semantics; reduced-motion-safe highlight.
- [ ] No print stylesheet, no gating, no new card content.
